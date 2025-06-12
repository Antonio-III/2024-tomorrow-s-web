import logo from "./logo.svg";
import githubLogo from "./github-mark-white.svg";
import './App.css';

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Editor from "@monaco-editor/react";
import hljs from "highlight.js/lib/common";

// In Render, I put the backend url in the Environment variable. The value can be configured on Render.
const renderBackendUrl = process.env.REACT_APP_BACKEND_URL;

const llmModel = process.env.REACT_APP_LLM;

const gitHubLink = process.env.REACT_APP_GITHUB_URL;

const aboutDescription = `Project Just A Coding Assistant (JACA) is a full-stack web service that uses Google's ${llmModel} Model. The Model is prompt engineered to answer questions related to coding. The Model reminds that it's JACA when asked about anything else. This is because I want to use the VS Code editor and it would be unfortunate if it wasn't used.`;




// Normal Javascript function. It is called within the App component.
function detectLanguage(code) {
    const result = hljs.highlightAuto(code);
    return result.language || "plaintext";
} 

// App Component; The HTML that users will see when they go on the site.
function App() {
    
    const [code, setCode] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    // For language-detection of the code input area.
    const [language, setLanguage] = useState("python");

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${renderBackendUrl}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, question })
            });

            const data = await res.json();
            setAnswer(data.answer || data.error || "Unknown error");
        } catch (err) {
            setAnswer("Error: " + err.message);
        }
        setLoading(false);

    };

    return(
        <div style={{ padding: 20, backgroundColor: "rgb(  7,  19,  34)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <a href="./"> 
                    <img 
                        src={logo} 
                        alt="JACA Logo"
                        />
                    </a>
                <a href={gitHubLink}> 
                    <img 
                        src={githubLogo} 
                        alt="Github link"
                    />
                </a>
            </div>
            <h1 style={{ fontSize: "48px" }}>JACA</h1>
            <Editor
                height="300px"
                language={language}
                defaultValue="# Write your code here"
                value={code}
                onChange={(value) => {
                    const inputtedCode = value ?? "";
                    const lang = detectLanguage(inputtedCode);
                    setCode(inputtedCode);
                    setLanguage(lang);
                }}
                theme="vs-dark" // `vs-dark` or `light`
                options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    automaticLayout: true
                }}
            />
            <br />
            <textarea
                rows="4"
                cols="80"
                placeholder="Ask a question about coding..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            /><br />
            <button 
                onClick={handleSubmit}
            >
                {loading ? "Processing..." : "Submit"}
            </button>
            <div style={{ marginTop: 20}}>
                <h3 style={{ color: "#fff" }}>Response:</h3>
                <div 
                    style={{
                        whiteSpace: "pre-wrap",
                        border: "none",
                        padding: "10px",
                        backgroundColor: "rgb( 0,  0,  0)", // same color as vs-dark
                        color: "#fff",
                    }}
                >
                    <ReactMarkdown
                        children={answer}
                        components={{
                            code({ node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    />
                </div>
            </div>
            {/* About Section */}
            <div style={{ marginTop: "40px", padding: "20px", borderTop: "1px solid rgb(53, 127, 255)" }}>
                <h2>About</h2>
                <p style={{ lineHeight: "1.6", color: "#fff" }}>
                    {aboutDescription}
                </p>
            </div>
        </div>
    );
}


export default App;