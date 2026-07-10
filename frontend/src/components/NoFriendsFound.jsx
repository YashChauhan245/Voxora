const NoFriendsFound = () => {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: "rgba(10,10,20,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="text-4xl mb-3">👥</div>
      <h3 className="font-semibold text-white text-lg mb-1.5">No friends yet</h3>
      <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">
        Connect with language partners below to start practicing together!
      </p>
    </div>
  );
};

export default NoFriendsFound;