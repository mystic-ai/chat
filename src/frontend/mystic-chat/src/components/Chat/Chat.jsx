import styles from './styles.module.css';
import classNames from 'classnames';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { CopyBlock, nord } from "react-code-blocks";

function ChatMessage({ role, content }) {
    return (
        <div className={classNames(styles["chat-message"], role === "assistant" ? styles["chat-box-assistant"] : undefined)}>
            <Image alt="chat-user" src={role === "assistant" ? "/assets/mystic-icon.svg" : "/assets/user-icon.svg"} width={40} height={40} />
            <div className={styles["chat-message-content"]}>
                <Markdown className={styles["markdown"]} components={{
                    code(_props) {
                        if (
                            _props.children !== undefined &&
                            _props.children.includes("\n")
                        ) {
                            return (
                                <CopyBlock
                                    text={_props.children}
                                    language={_props.className !== undefined && _props.className.replace("language-", "")}
                                    showLineNumbers={true}
                                    theme={nord}
                                    wrapLines={true}
                                    customStyle={{
                                        fontSize: "14px",
                                        display: "flex",
                                        maxWidth: "100%",
                                        width: "100%",
                                    }}
                                />
                            );
                        }

                        return (
                            <code style={{ fontWeight: "bold" }}>{_props.children}</code>
                        );
                    },
                }}>
                    {content}
                </Markdown>
            </div>
        </div>
    )
}

export default function Chat() {
    const [conversation, setConversation] = useState([

    ]);

    const [sources, setSources] = useState([

    ]);

    const [input, setInput] = useState("");

    // Scroll to the bottom of the conversation
    const messageContainerRef = useRef(null);


    // Listen to the escape key and clear the conversation
    useEffect(() => {
        function handleEscapeKey(event) {
            if (event.key === "Escape") {
                setConversation([]);
                setSources([]);
            }
        }

        window.addEventListener("keydown", handleEscapeKey);

        return () => {
            window.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);



    function sendMessage() {
        // setConversation();
        let newConversation = [...conversation, {
            role: "user",
            content: input
        }];
        setInput("");
        setConversation(newConversation);
        let sourcesUpdated = false;

        fetch("/v1/runs/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: [
                    {
                        type: "array",
                        value: [
                            newConversation
                        ]
                    }, {
                        type: "dictionary",
                        value: {}
                    }
                ]
            })
        }).then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let bufferedText = "";

            reader.read().then(function processText({ done, value }) {
                if (done) {
                    console.log("Stream complete");
                    return;
                }
                const text = decoder.decode(value, { stream: true });

                bufferedText += text;

                let lastJsonEnd = 0;

                const jsonRegex = /{.*}\n/g;
                let match;
                let jsonsToParse = [];


                while ((match = jsonRegex.exec(bufferedText)) !== null) {
                    jsonsToParse.push(match[0]);
                    lastJsonEnd = jsonRegex.lastIndex;

                    bufferedText = bufferedText.substring(lastJsonEnd);
                }

                jsonsToParse.forEach(jsonString => {
                    const json = JSON.parse(jsonString);
                    let newConversation2 = newConversation.slice();

                    if (newConversation2.length > 0 && newConversation2[newConversation2.length - 1].role === "assistant") {
                        newConversation2[newConversation2.length - 1].content += json.outputs[0].value[0].content;
                    } else {
                        newConversation2.push({

                            role: "assistant",
                            content: json.outputs[0].value[0].content
                        });
                    }
                    setConversation(newConversation2);

                    console.log(json);
                    newConversation = newConversation2;
                    if (!sourcesUpdated) {
                        setSources(json.outputs[1].value);
                        sourcesUpdated = true;
                    }


                    // Make sure the page is scrolled to the bottom
                    if (messageContainerRef.current !== null) {
                        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
                    }

                });

                reader.read().then(processText).catch(error => {
                    // console.error(error);
                });

            }).catch(error => {
                // console.error(error);
            })
                ;
        }).catch(error => {
            // console.error(error);
        });
    }

    return (
        <div className={styles["chat-body"]}>
            <div className={styles["chat-column"]}>
                <div className={styles["chat-container"]} ref={messageContainerRef}>
                    <div className={styles["chat-header"]}>
                        {conversation.length > 0 &&
                            <div className={styles["chat-header-reset-button"]} onClick={() => {
                                setConversation([]);
                                setSources([]);
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 15L10 19L14 23" stroke-width="2" />
                                    <path d="M5.93782 15.5C5.16735 14.1655 4.85875 12.6141 5.05989 11.0863C5.26102 9.55856 5.96064 8.13986 7.05025 7.05025C8.13986 5.96064 9.55856 5.26102 11.0863 5.05989C12.6141 4.85875 14.1655 5.16735 15.5 5.93782C16.8345 6.70829 17.8775 7.89757 18.4672 9.32122C19.0568 10.7449 19.1603 12.3233 18.7615 13.8117C18.3627 15.3002 17.4838 16.6154 16.2613 17.5535C15.0388 18.4915 13.5409 19 12 19" strokeWidth="2" strokeLinecap="round" />
                                </svg>

                            </div>}
                        CONVERSATION
                    </div>
                    <div
                        className={styles["chat-message-container"]}>
                        {
                            conversation.map((message, index) => {
                                return (
                                    <ChatMessage
                                        key={index}
                                        role={message.role}
                                        content={message.content}
                                    />
                                );
                            })
                        }
                    </div>
                    <div className={styles["chat-input-container"]}>

                        <input value={input}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                            onChange={(e) => setInput(e.target.value)} type="text" className={styles["chat-input"]} tabIndex={0} autoComplete="off" autoCorrect='off' autoCapitalize='off' spellCheck="false" />

                        <div className={styles["chat-input-submit"]} onClick={sendMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none">
                                <path d="M7 1.5L6.29289 0.792893L7 0.0857862L7.70711 0.792893L7 1.5ZM8 16.5C8 17.0523 7.55229 17.5 7 17.5C6.44772 17.5 6 17.0523 6 16.5L8 16.5ZM0.292893 6.79289L6.29289 0.792893L7.70711 2.20711L1.70711 8.20711L0.292893 6.79289ZM7.70711 0.792893L13.7071 6.79289L12.2929 8.20711L6.29289 2.20711L7.70711 0.792893ZM8 1.5L8 16.5L6 16.5L6 1.5L8 1.5Z" />
                            </svg>
                        </div>


                    </div>
                </div>
                <div className={styles["sources-container"]}>
                    <div className={styles["sources-header"]}>
                        SOURCES
                    </div>
                    {
                        sources.map((source, index) => {
                            return (
                                <div key={index} className={styles["source"]}>
                                    <div className={styles["source-url"]}>
                                        {source.link}
                                    </div>
                                    <a href={source.link} className={styles["source-title"]} target="_blank">
                                        {source.title}
                                    </a>
                                    <div className={styles["source-description"]}>
                                        {source.description}
                                    </div>
                                </div>)
                        })
                    }
                </div>

            </div>
        </div>
    );
};
