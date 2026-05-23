import useAuthUser from "../hooks/useAuthUser";
import ChatAIAssistant from "../components/ChatAIAssistant";

const AssistantPage = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-4">
        <div className="rounded-xl border border-base-300 bg-base-100/80 p-4">
          <h2 className="text-2xl font-bold">AI Chat Assistant</h2>
          <p className="text-sm opacity-70 mt-1">
            Translate, improve grammar, generate conversation starters, and practice pronunciation.
          </p>
        </div>

        <ChatAIAssistant authUser={authUser} />
      </div>
    </div>
  );
};

export default AssistantPage;
