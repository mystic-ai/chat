import json
import os
from concurrent.futures import ThreadPoolExecutor

from bs4 import BeautifulSoup
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from httpx import AsyncClient, Client
from pipeline.cloud.schemas import runs as run_schemas

router = APIRouter(prefix="/runs", tags=["runs"])


def get_webpage(url: str) -> str:
    try:
        with Client(
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  # noqa
            },
            follow_redirects=True,
        ) as client:
            response = client.get(url)
            return response.text
    except Exception:
        return "PAGE COULD NOT BE LOADED"


async def get_search_results(prompts: list[list[dict[str, str]]]) -> list:
    chat = prompts[0]

    all_user_messages = [
        message["content"] for message in chat if message["role"] == "user"
    ]

    search_term = all_user_messages[-1]

    search_engine_id = os.environ.get("GOOGLE_SEARCH_ENGINE_ID")
    search_engine_key = os.environ.get("GOOGLE_SEARCH_ENGINE_KEY")
    response_count = 5
    async with AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/customsearch/v1",
            params=dict(
                key=search_engine_key,
                cx=search_engine_id,
                q=search_term,
            ),
        )

    response_json = response.json()

    response_items = response_json.get("items", [])
    response_items = response_items[: min(len(response_items), response_count)]

    # raw_html = [self.get_webpage(item["link"]) for item in response_items]
    # Get pages in individual threads
    with ThreadPoolExecutor() as executor:
        raw_html = list(
            executor.map(get_webpage, [item["link"] for item in response_items])
        )

    page_data = [
        {
            "html": BeautifulSoup(html, "html.parser").get_text(),
            "link": page["link"],
            "title": page["title"],
            "description": page["snippet"],
        }
        for page, html in zip(response_items, raw_html)
    ]
    return page_data


@router.post("/", response_model=run_schemas.ContainerRunResult)
async def run(
    run_create_schema: run_schemas.ContainerRunCreate,
):
    chats = run_create_schema.inputs[0].value
    search_results = await get_search_results(chats)

    system_prompt = "You are an assistant. Be short and concise, don't give unnecessary information, always end a message with a fullstop or questionmark. If required, show code snippets in the response in markdown format (don't forget to include the language reference). Here's some raw webpage text to help you answer the user's questions, you don't need to use the information unless its relevant to the conversation. Raw webpage text:"  # noqa
    for res in search_results:
        # system_prompt += "\nWebsite:\n" + res[: min(500, len(res))]
        system_prompt += "\n"
        system_prompt += "Title: " + res["title"] + "\n"
        system_prompt += "Link: " + res["link"] + "\n"
        system_prompt += "Page text:\n" + res["html"][: min(500, len(res["html"]))]

    system_prompt = {"role": "system", "content": system_prompt}
    # system_prompt = {"role": "system", "content": "you are an assistant."}
    print(run_create_schema.dict(), flush=True)
    run_create_schema.inputs[0].value[0].insert(0, system_prompt)

    model_url = os.environ.get("MODEL_URL")
    model_url += "/v4/runs/stream"

    async def stream_response():
        client = AsyncClient()
        async with client.stream(
            "POST",
            model_url,
            headers={"Content-Type": "application/json"},
            json=run_create_schema.dict(),
        ) as response:
            async for chunk in response.aiter_lines():
                # print(chunk, flush=True)
                json_response = json.loads(chunk)
                # json_response["outputs"].append()
                if json_response.get("outputs"):
                    json_response["outputs"].append(
                        {
                            "type": "array",
                            "value": search_results,
                        }
                    )

                yield json.dumps(json_response) + "\n"

                # yield chunk

    return StreamingResponse(
        stream_response(),
        media_type="application/json",
        headers={"X-Accel-Buffering": "no"},
    )
