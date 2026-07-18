import useAuthUser from "../hooks/useAuthUser";
import ChatAIAssistant from "../components/ChatAIAssistant";
import { SparklesIcon } from "lucide-react";

const AssistantPage = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="page-header">
          <p className="badge badge-primary gap-1 px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold w-fit bg-primary/10 border-primary/20">
            <SparklesIcon className="size-3 text-primary" />
            AI Workspace
          </p>
          <h1 className="page-header-title mt-2">AI Assistant</h1>
          <p className="page-header-subtitle">
            Translate messages, evaluate grammar, generate conversation starters, and analyze pronunciation in real-time.
          </p>
        </div>

        <ChatAIAssistant authUser={authUser} />
      </div>
    </div>
  );
};

export default AssistantPage;
