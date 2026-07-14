const NoFriendsFound = () => {
  return (
    <div className="rounded-2xl p-10 text-center bg-base-200/60 border border-primary/15">
      <div className="text-4xl mb-3">👥</div>
      <h3 className="font-semibold text-base-content text-lg mb-1.5">No friends yet</h3>
      <p className="text-sm text-base-content/40 max-w-xs mx-auto leading-relaxed">
        Connect with language partners below to start practicing together!
      </p>
    </div>
  );
};

export default NoFriendsFound;