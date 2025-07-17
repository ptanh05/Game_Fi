import Link from "next/link";
export function MainContent() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="mt-4 mx-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Brutato Games
        </h1>
        <p className="mb-8">
          Experience the future of gaming on the Cardano blockchain
        </p>
        <Link href="/Game">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-md font-bold">
            Start Playing Now
          </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="mt-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        {/* Feature 1 */}
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center text-purple-500">
              <svg
                viewBox="0 0 24 24"
                width={36}
                height={36}
                stroke="currentColor"
                fill="none"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="2"
                  strokeWidth="2"
                />
                <path d="M8 2v3M16 2v3M4 10h16" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4  text-white">
            Immersive Gameplay
          </h2>
          <p className="text-gray-400">
            Dive into stunning worlds with captivating storylines and
            challenging quests.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center text-purple-500">
              <svg
                viewBox="0 0 24 24"
                width={36}
                height={36}
                stroke="currentColor"
                fill="none"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 6v6l4 2" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4  text-white">Play-to-Earn</h2>
          <p className="text-gray-400">
            Earn real value while you play. Your skills translate to tangible
            rewards.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center text-purple-500">
              <svg
                viewBox="0 0 24 24"
                width={36}
                height={36}
                stroke="currentColor"
                fill="none"
              >
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  strokeWidth="2"
                />
                <circle cx="9" cy="7" r="4" strokeWidth="2" />
                <path
                  d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <h2
            className="text-xl font-bold mb-4 text-white
            "
          >
            Vibrant Community
          </h2>
          <p className="text-gray-400">
            Join thousands of players in a thriving ecosystem of gamers and
            creators.
          </p>
        </div>
      </section>
    </div>
  );
}
