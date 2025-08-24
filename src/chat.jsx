import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://chatify-api.up.railway.app/messages";
const GET_API_URL = "https://chatify-api.up.railway.app/conversations";

const Chat = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const currentUser = "Du";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);

  // Fake chat-bot
  const [fakeChat, setFakeChat] = useState([
    {
      text: "Tja tja, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
    },
    {
      text: "Hallå!! Svara då!!",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
    },
    {
      text: "Sover du eller?! 😴",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
    },
  ]);

  // Kontrollera inloggning
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Hämta meddelanden från API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(GET_API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Kunde inte hämta meddelanden");
        const data = await res.json();

        if (data.participating && data.participating.length > 0) {
          setMessages(data.participating[0].messages || []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setError("Kunde inte hämta meddelanden.");
      }
    };

    fetchMessages();
  }, []);

  // Scrolla till botten
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Skicka meddelande till API + bot
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messagePayload = {
      text: newMessage,
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      });

      if (!res.ok) throw new Error("Något gick fel när meddelandet skickades");

      const data = await res.json();

      // Lägg till användarens meddelande
      if (data.latestMessage) {
        setMessages((prev) => [...prev, data.latestMessage]);
      }

      setNewMessage("");

      // Bot svarar automatiskt efter 1 sekund
      setTimeout(() => {
        const botReply = fakeChat[Math.floor(Math.random() * fakeChat.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: botReply.text,
            userId: botReply.username,
            avatar: botReply.avatar,
            conversationId: null,
          },
        ]);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Kunde inte skicka meddelandet.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Chat</h2>
        <button
          onClick={handleLogout}
          style={{ padding: "5px 10px", borderRadius: "8px" }}
        >
          Logga ut
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <div
        style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "10px" }}
      >
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.userId === currentUser;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: isCurrentUser ? "row-reverse" : "row",
                marginBottom: "10px",
                alignItems: "flex-start",
              }}
            >
              <img
                src={msg.avatar || `https://i.pravatar.cc/100?u=${msg.userId}`}
                alt="avatar"
                width={40}
                height={40}
                style={{ borderRadius: "50%", margin: "0 10px" }}
              />
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "70%",
                  border: "1px solid #ccc",
                }}
              >
                <strong>{msg.userId || "Okänd"}</strong>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          placeholder="Skriv ett meddelande..."
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "12px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "8px 12px",
            marginLeft: "5px",
            borderRadius: "12px",
          }}
        >
          Skicka
        </button>
      </div>
    </div>
  );
};

export default Chat;
