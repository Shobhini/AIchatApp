"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat =async() => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      // console.log(error);
      setResponse("Error: " + error.message);
    }

    setLoading(false);
  }

  const handleStreamChat = async() => {
    setLoading(true);
    setStreaming(true);
    setStreamResponse("");

    try{
      const res= await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      })

      const reader= res.body.getReader();
      const decoder= new TextDecoder();

      while(true){
        const {done, value}= await reader.read()
        if(done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n")

        for(const line of lines){
          if(line.startsWith("data: ")){
            const data= JSON.parse(line.slice(6));
            setStreamResponse((prev) => prev + data.content);
          }
        }
      }
    } catch (error){
      setStreamResponse("Error: " + error.message);
    }

    setLoading(false);
    setStreaming(false);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome to AI Next.js App</h1>

      <div>
        <textarea 
          className={styles.textarea} 
          rows={10} 
          placeholder="Type your message here..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
      </div>

      <div>
        <button style={{padding: "10px 20px", backgroundColor: "orange"}} 
        className={styles.button} 
        onClick={handleChat} disabled={loading}>
          {loading ? "Loading..." : "Send"}
        </button>
      </div>

      <div 
      style={{border: "1px solid #ccc", 
        padding: "10px",
         whiteSpace: "pre-wrap",
        }}
      className={styles.response}>
        {response}
      </div>

      <div>
        <button style={{padding: "10px 20px", backgroundColor: "green"}} 
        className={styles.button} 
        onClick={handleStreamChat}
        
         disabled={loading}>
          {loading ? "Loading..." : "stream chat"}
        </button>
      </div>

      <div 
      style={{border: "1px solid #ccc", 
        padding: "10px",
         whiteSpace: "pre-wrap",
        //  marginBottom: "5px 0"
        }}
      className={styles.response}>
        {streamResponse}
      </div>
    </div>

    
  );
}

