import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Clock,
  Loader,
  LogOut,
  ArrowUpFromLine,
  CircleX,
  Globe,
  AlertTriangle,
  ChevronDown,
  Lock,
  Menu,
  Terminal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const IMFIntelligenceTerminal = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState("green");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [typingEffects, setTypingEffects] = useState({});
  const [statusData, setStatusData] = useState({
    securityStatus: "SECURE",
    agentStatus: "ACTIVE",
    mission: "CLASSIFIED",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  const themeColors = {
    green: {
      primary: "text-green-500",
      secondary: "text-green-400",
      accent: "text-yellow-400",
      border: "border-green-800",
      button: "bg-green-900 hover:bg-green-800",
      shadow: "shadow-green-500/20",
      hover: "hover:bg-green-900/30",
      prompt: "text-green-300",
      bgAccent: "bg-green-900/20",
      textHighlight: "text-green-200",
      error: "text-red-400",
      system: "text-blue-400",
    },
    blue: {
      primary: "text-blue-500",
      secondary: "text-blue-400",
      accent: "text-cyan-400",
      border: "border-blue-800",
      button: "bg-blue-900 hover:bg-blue-800",
      shadow: "shadow-blue-500/20",
      hover: "hover:bg-blue-900/30",
      prompt: "text-blue-300",
      bgAccent: "bg-blue-900/20",
      textHighlight: "text-blue-200",
      error: "text-red-400",
      system: "text-emerald-400",
    },
    amber: {
      primary: "text-amber-500",
      secondary: "text-amber-400",
      accent: "text-white",
      border: "border-amber-800",
      button: "bg-amber-900 hover:bg-amber-800",
      shadow: "shadow-amber-500/20",
      hover: "hover:bg-amber-900/30",
      prompt: "text-amber-300",
      bgAccent: "bg-amber-900/20",
      textHighlight: "text-amber-200",
      error: "text-red-400",
      system: "text-teal-400",
    },
  };

  const currentTheme = themeColors[theme];

  useEffect(() => {
    const generateId = () => {
      const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let id = "";
      for (let i = 0; i < 8; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return id;
    };
    setSessionId(generateId());
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const startTypingEffect = (messageId, text) => {
    let currentText = "";
    let index = 0;
    const typingSpeed = 15;

    const typeNextChar = () => {
      if (index < text.length) {
        currentText += text.charAt(index);
        setTypingEffects((prev) => ({
          ...prev,
          [messageId]: currentText,
        }));
        index++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        setTypingEffects((prev) => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      }
    };

    typeNextChar();
  };

  const handleAuthentication = () => {
    setAuthenticating(true);
    setAuthError("");

    setTimeout(() => {
      if (accessCode === "IMF-1996" || accessCode === "4815162342") {
        setAuthenticated(true);
        addSystemMessage(
          "Authentication successful. Welcome to IMF Intelligence Terminal."
        );
      } else {
        setAuthError("Authentication failed. Security protocol engaged.");
        setTimeout(() => {
          setAuthError("Access denied. Countermeasures active.");
        }, 1000);
      }
      setAuthenticating(false);
    }, 1200);
  };

  const addMessage = (content, type = "user") => {
    const id = Date.now();
    const newMessage = {
      id,
      content,
      type,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    if (type === "system" || type === "response") {
      startTypingEffect(id, content);
    }

    return id;
  };

  const addSystemMessage = (content) => {
    addMessage(content, "system");
  };

  const processQuery = async (query) => {
    try {
      const response = await fetch("/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const responseData = await response.json();
      return { type: "response", text: responseData.answer }; // Expecting 'answer' field in response
    } catch (error) {
      console.error("Query Error:", error);
      return {
        type: "error",
        text: `Mission Transmission Error: Secure Channel Compromised. ${error.message}`,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText;
    addMessage(userQuery, "user");
    setInputText("");
    setIsProcessing(true);

    if (userQuery && !commandHistory.includes(userQuery)) {
      setCommandHistory([userQuery, ...commandHistory]);
    }
    setHistoryIndex(-1);

    const processingId = addMessage("Processing query...", "processing");

    try {
      const result = await processQuery(userQuery);

      setMessages((prev) => prev.filter((msg) => msg.id !== processingId));

      if (result.type === "error") {
        addMessage(result.text, "error");
      } else {
        addMessage(result.text, "response");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== processingId));
      addMessage(
        "Error: Connection failure. Terminal security may be compromised.",
        "error"
      );
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setInputText(commandHistory[historyIndex + 1] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        setHistoryIndex(historyIndex - 1);
        if (historyIndex === 0) {
          setInputText("");
        } else {
          setInputText(commandHistory[historyIndex - 1] || "");
        }
      }
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (authenticated) {
      const currentDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      addSystemMessage(`IMF INTELLIGENCE TERMINAL INITIALIZED: ${currentDate}`);
      addSystemMessage(`SESSION ID: ${sessionId} | CLEARANCE: SAP/LEVEL 5`);

      if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [authenticated, sessionId]);

  const resetTerminal = () => {
    setAuthenticated(false);
    setAccessCode("");
    setMessages([]);
    setInputText("");
    setAuthError("");
    setCommandHistory([]);
    setHistoryIndex(-1);
    setTypingEffects({});
    setMobileMenuOpen(false);
  };

  const changeTheme = (newTheme) => {
    if (themeColors[newTheme]) {
      setTheme(newTheme);
      addSystemMessage(`Terminal theme updated to ${newTheme}`);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const mobileMenuOptions = [
    {
      label: "Change Theme",
      action: () => {
        const nextTheme =
          theme === "green" ? "blue" : theme === "blue" ? "amber" : "green";
        changeTheme(nextTheme);
        setMobileMenuOpen(false);
      },
    },
    {
      label: "Exit Terminal",
      action: () => {
        resetTerminal();
        setMobileMenuOpen(false);
      },
    },
  ];

  if (!authenticated) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        } ${currentTheme.primary} font-mono p-4 transition-colors duration-300`}
      >
        <div
          className={`w-full max-w-md p-4 sm:p-6 border ${
            currentTheme.border
          } rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg ${
            currentTheme.shadow
          } transition-all duration-300`}
        >
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-md sm:text-lg md:text-xl font-bold text-white text-center">
              IMF Intelligence Division
            </h1>
          </div>

          <div className="mb-4 text-center text-yellow-500 py-1 px-3 bg-yellow-900/20 rounded">
            <p className="text-xs tracking-wider">Classified SYSTEM</p>
            <p className="text-xs">"LEVEL 5 / SAP" Clearance Required</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-3 pb-2">
              <div className="flex flex-col sm:flex-row items-center text-xs text-gray-400">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Terminal className="w-3 h-3 mr-1" />
                  <span>TERM ID: {sessionId || "INITIALIZING..."}</span>
                </div>
                <div className="flex items-center sm:ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {currentTime.toLocaleString("en-US", { hour12: false })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuthentication();
            }}
            className="space-y-4"
          >
            <div className="flex flex-col">
              <input
                id="access-code"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className={`w-full text-sm px-4 py-2 ${
                  darkMode ? "bg-gray-900" : "bg-gray-100"
                } border ${currentTheme.border} rounded ${
                  currentTheme.primary
                } text-center focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:${
                  currentTheme.border
                } transition-colors`}
                placeholder="ENTER ACCESS CODE"
                disabled={authenticating}
                autoFocus
              />

              {authError && (
                <div className="text-red-400 text-sm mt-2 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <p>{authError}</p>
                </div>
              )}

              <p className="text-xs text-center text-gray-500 mt-2">
                Hint ðŸ•µï¸â€â™€ï¸: Use "IMF-1996" for access
              </p>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className={`w-full px-4 py-2 ${currentTheme.button} ${
                darkMode ? "text-white" : "text-white"
              } font-bold rounded transition-colors flex justify-center items-center`}
            >
              {authenticating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  VERIFYING...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  AUTHENTICATE
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-xs text-center text-gray-500">
            <p className="flex items-center justify-center">
              Unauthorized access attempts will be reported
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } ${currentTheme.primary} font-mono`}
    >
      <div
        className={`flex justify-between items-center px-2 sm:px-4 py-2 border-b ${
          currentTheme.border
        } ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <div className="flex items-center">
          <h1
            className={`text-sm sm:text-lg font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            IMF INTELLIGENCE
          </h1>
          <span
            className={`ml-1 px-1 py-0.5 text-xs bg-gray-800 rounded-sm hidden sm:inline-block ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            v3.1
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`hidden sm:flex items-center px-2 py-1 rounded ${
              darkMode ? "bg-gray-900/50" : "bg-gray-300/50"
            } ${currentTheme.border}`}
          >
            <Clock
              className={`w-3 h-3 mr-1 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <span className={darkMode ? "text-white" : "text-gray-800"}>
              {currentTime.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
          <div
            className={`hidden sm:flex items-center px-2 py-1 rounded ${
              darkMode ? "bg-gray-900/50" : "bg-gray-300/50"
            } ${currentTheme.border}`}
          >
            <Globe
              className={`w-3 h-3 mr-1 ${
                statusData.securityStatus === "SECURE"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            />
            <span
              className={
                statusData.securityStatus === "SECURE"
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {statusData.securityStatus}
            </span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className={`sm:hidden px-2 py-1 border ${currentTheme.border} ${currentTheme.hover} rounded`}
          >
            <Menu className={`w-4 h-4 ${currentTheme.primary}`} />
          </button>
          <button
            onClick={resetTerminal}
            className={`hidden sm:flex px-2 sm:px-3 py-1 text-center border ${currentTheme.border} text-red-400 ${currentTheme.hover} transition-colors items-center rounded`}
          >
            <LogOut className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`sm:hidden absolute top-12 right-2 z-50 w-48 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border ${currentTheme.border} rounded-md shadow-lg`}
        >
          <div className="py-1">
            {mobileMenuOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } ${darkMode ? "text-white" : "text-gray-800"} ${
                  currentTheme.primary
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`flex flex-wrap items-center justify-between px-2 sm:px-4 py-1 border-b ${
          currentTheme.border
        } ${darkMode ? "bg-gray-800/70" : "bg-gray-200/80"} text-xs`}
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center">
            <span
              className={`${darkMode ? "text-gray-400" : "text-gray-600"} mr-1`}
            >
              AGENT:
            </span>
            <span
              className={
                statusData.agentStatus === "ACTIVE"
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {statusData.agentStatus}
            </span>
          </div>
          <div className="hidden sm:flex items-center">
            <span
              className={`${darkMode ? "text-gray-400" : "text-gray-600"} mr-1`}
            >
              MISSION:
            </span>
            <span className={currentTheme.accent}>{statusData.mission}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            } mr-1 hidden sm:inline`}
          >
            SESSION:
          </span>
          <span className={currentTheme.accent}>{sessionId}</span>
        </div>
      </div>

      <div
        ref={terminalRef}
        className={`flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 font-mono text-xs custom-scrollbar ${
          darkMode ? "bg-gray-900/70" : "bg-gray-100"
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Terminal className="w-12 h-12 mb-4" />
            <p className="text-sm">Terminal initialized. Awaiting input.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`terminal-message ${message.type} py-1 transition-all border-b border-gray-800/30 ${currentTheme.hover}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div
                    className={`text-xs text-gray-400 whitespace-nowrap mb-1 sm:mb-0 sm:mr-2`}
                  >
                    [
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                    ]
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                    {message.type === "user" && (
                      <div
                        className={`flex flex-col sm:flex-row sm:items-start ${currentTheme.accent}`}
                      >
                        <span className="font-bold whitespace-nowrap mb-1 sm:mb-0 sm:mr-2">
                          AGENT:
                        </span>
                        <span className="overflow-x-auto">
                          {message.content}
                        </span>
                      </div>
                    )}
                    {message.type === "response" && (
                      <div
                        className={`flex flex-col sm:flex-row ${currentTheme.secondary}`}
                      >
                        <span className="text-xs font-bold flex-shrink-0 whitespace-nowrap mb-1 sm:mb-0 sm:mr-2">
                          SYSTEM:
                        </span>
                        <span className="overflow-x-auto whitespace-pre-wrap">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className={`markdown-body ${
                              darkMode ? "prose-invert" : ""
                            } prose prose-sm max-w-none`}
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1
                                  className={`text-lg font-bold ${currentTheme.primary} mt-2 mb-2`}
                                  {...props}
                                />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2
                                  className={`text-md font-bold ${currentTheme.primary} mt-2 mb-2`}
                                  {...props}
                                />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3
                                  className={`text-sm font-bold ${currentTheme.secondary} mt-1 mb-1`}
                                  {...props}
                                />
                              ),
                              code: ({ node, ...props }) => (
                                <code
                                  className={`px-1 py-0.5 rounded ${
                                    darkMode ? "bg-gray-800" : "bg-gray-200"
                                  }`}
                                  {...props}
                                />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  className={`${currentTheme.primary} underline`}
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc pl-5 space-y-1"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-5 space-y-1"
                                  {...props}
                                />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              hr: ({ node, ...props }) => (
                                <hr
                                  className={`border-t ${currentTheme.border} my-2`}
                                  {...props}
                                />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote
                                  className={`border-l-2 ${currentTheme.border} pl-2 italic`}
                                  {...props}
                                />
                              ),
                              table: ({ node, ...props }) => (
                                <table
                                  className="min-w-full border-collapse my-2"
                                  {...props}
                                />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className={`border ${currentTheme.border} px-2 py-1 font-bold text-xs text-center`}
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className={`border ${currentTheme.border} px-2 py-1 text-xs`}
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {typingEffects[message.id] !== undefined
                              ? typingEffects[message.id]
                              : message.content}
                          </ReactMarkdown>
                        </span>
                      </div>
                    )}
                    {message.type === "error" && (
                      <div
                        className={`flex flex-col sm:flex-row ${currentTheme.error}`}
                      >
                        <span className="font-bold flex-shrink-0 whitespace-nowrap mb-1 sm:mb-0 sm:mr-2">
                          SYSTEM:
                        </span>
                        <span className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {message.content}
                        </span>
                      </div>
                    )}
                    {message.type === "system" && (
                      <div className={`${currentTheme.system}`}>
                        <span className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {message.content}
                        </span>
                      </div>
                    )}
                    {message.type === "processing" && (
                      <div
                        className={`flex flex-col sm:flex-row ${currentTheme.secondary}`}
                      >
                        <span className="text-xs font-bold flex-shrink-0 whitespace-nowrap mb-1 sm:mb-0 sm:mr-2">
                          SYSTEM:
                        </span>
                        <span className="animate-pulse flex items-center">
                          <Loader
                            className={`w-3 h-3 mr-1 animate-spin ${currentTheme.secondary}`}
                          />
                          Processing query...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`p-3 sticky bottom-0 border-t ${currentTheme.border} ${
          darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
        } backdrop-blur-sm`}
      >
        <div className="flex items-center">
          <span className={`${currentTheme.accent} text-sm font-bold mr-2`}>
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            placeholder="Enter query..."
            className={`flex-1 bg-transparent border-none text-sm ${
              currentTheme.accent
            } focus:outline-none ${darkMode ? "text-white" : "text-gray-800"}`}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setInputText("")}
            className={`p-1 text-sm ${
              inputText ? "opacity-100" : "opacity-0"
            } transition-opacity`}
          >
            <CircleX
              className={`w-4 h-4 ${
                darkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            />
          </button>
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className={`px-2 sm:px-3 py-1 ${currentTheme.button} text-white text-xs rounded disabled:opacity-50 transition-colors flex items-center`}
          >
            <ArrowUpFromLine className="w-3 h-4 sm:mr-1" />
            <span className="hidden sm:inline">SEND</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default IMFIntelligenceTerminal;