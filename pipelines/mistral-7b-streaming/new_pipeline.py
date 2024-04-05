from threading import Thread

import torch
from pipeline import Pipeline, entity, pipe
from pipeline.objects.graph import InputField, InputSchema, Stream, Variable
from transformers import AutoTokenizer, MistralForCausalLM, TextIteratorStreamer


class ModelKwargs(InputSchema):
    do_sample: bool | None = InputField(default=False)
    use_cache: bool | None = InputField(default=True)
    temperature: float | None = InputField(default=0.6)
    top_k: float | None = InputField(default=50)
    top_p: float | None = InputField(default=0.9)
    max_new_tokens: int | None = InputField(default=3000, ge=1, le=4096)


class ChatStreamer(TextIteratorStreamer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.index = 0
        self.returned_length = 0

    def __next__(self):
        value = self.text_queue.get(timeout=self.timeout, block=True)

        if value == self.stop_signal:
            raise StopIteration()
        else:
            self.index += 1
            return [{"role": "assistant", "content": value}]

    def put(self, value):
        if len(value.shape) > 1 and value.shape[0] > 1:
            raise ValueError("TextStreamer only supports batch size 1")
        elif len(value.shape) > 1:
            value = value[0]

        if self.skip_prompt and self.next_tokens_are_prompt:
            self.next_tokens_are_prompt = False
            return

        if False:
            self.token_cache.extend(value.tolist())
            text = self.tokenizer.decode(self.token_cache, **self.decode_kwargs)

            if text.endswith((".", "!", "?")):
                printable_text = text[self.print_len :] + " "
                self.token_cache = []
                self.print_len = 0

            elif len(text) > 0 and self._is_chinese_char(ord(text[-1])):
                printable_text = text[self.print_len :]
                self.print_len += len(printable_text)
            else:
                printable_text = text[self.print_len : text.rfind(" ") + 1]
                self.print_len += len(printable_text)
        else:
            self.token_cache.extend(value.tolist())
            printable_text = self.tokenizer.decode(
                self.token_cache, **self.decode_kwargs
            )

            new_length = len(printable_text)
            old_length = self.returned_length

            printable_text = printable_text[old_length:new_length]
            self.returned_length = new_length

        self.on_finalized_text(printable_text)


@entity
class Mistral7B:
    @pipe(on_startup=True, run_once=True)
    def load_model(self) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = (
            MistralForCausalLM.from_pretrained(
                "mistralai/Mistral-7B-Instruct-v0.1",
                use_safetensors=True,
                torch_dtype=torch.float16,
                device_map="auto",
            ).half()
            # .to(self.device)
        )
        self.tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")

    @pipe
    def inference(
        self, prompts: list[list[dict[str, str]]], kwargs: ModelKwargs
    ) -> Stream[list[dict[str, str]]]:
        streamer = ChatStreamer(
            self.tokenizer,
            skip_special_tokens=True,
            skip_prompt=True,
            timeout=20,
        )

        chat = prompts[0]

        chat_prompt: str = self.tokenizer.apply_chat_template(
            chat,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer(chat_prompt, return_tensors="pt").to(self.device)

        print(
            "Total number of input tokens:" + str(inputs.input_ids.shape[1]), flush=True
        )
        generation_kwargs = dict(inputs, streamer=streamer, **kwargs.to_dict())

        def thread_func(**kwargs):
            try:
                self.model.generate(**kwargs)
            except Exception:
                del self.model
                self.model = MistralForCausalLM.from_pretrained(
                    "mistralai/Mistral-7B-Instruct-v0.1",
                    use_safetensors=True,
                    torch_dtype=torch.float16,
                    device_map="auto",
                ).half()

        thread = Thread(target=thread_func, kwargs=generation_kwargs)

        thread.start()

        return Stream(streamer)


with Pipeline() as builder:
    prompt = Variable(list, default=[[{"user": "My name is"}]])
    kwargs = Variable(ModelKwargs)

    _pipeline = Mistral7B()
    _pipeline.load_model()

    out = _pipeline.inference(prompt, kwargs)

    builder.output(out)


my_pipeline = builder.get_pipeline()
