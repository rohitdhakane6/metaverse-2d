import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle, Send, Users, X } from "lucide-react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { setGameFocus } from "@/store/slices/arenaSlice";

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
}

export function Messages() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Rohit Dhakane", content: "hi", time: "12:41 AM" },
    {
      id: 2,
      sender: "Rohit Dhakane",
      content: "how are you",
      time: "12:42 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const nextId = messages.length + 1;
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages([
        ...messages,
        { id: nextId, sender: "You", content: newMessage, time: currentTime },
      ]);
      setNewMessage("");
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <MessageCircle />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Messages</TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-80 md:w-96 h-[calc(100vh-8rem)] rounded-lg mb-3 flex flex-col p-0 border-0 shadow-lg"
        side="top"
      >
        <div className="flex items-center justify-between p-3 bg-[#1B1D36] text-white  ">
          <div className="font-bold text-lg">Meet Room</div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>3</span>
              <Users className="w-4 h-4 ml-1" />
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-[#1B1D36] text-white p-4 space-y-3">
          <div className="text-center text-xs text-gray-400 my-2">
            March 23, 2025
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`text-sm flex flex-col space-y-1 ${message.sender === "You" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center">
                {message.sender !== "You" && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 mr-2 flex items-center justify-center text-xs">
                    {message.sender.charAt(0)}
                  </div>
                )}
                <div className="font-bold">{message.sender}</div>
                <span className="ml-2 text-xs text-gray-400">
                  {message.time}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  message.sender === "You"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 bg-[#1B1D36] border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Input
              onFocus={() => {
                dispatch(setGameFocus(false));
              }}
              onBlur={() => {
                dispatch(setGameFocus(true));
              }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />

            <Button
              variant="outline"
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
