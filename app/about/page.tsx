import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#FFB800]/10 to-[#FFC633]/10">
        <div className="excellence-container">
          <div className="max-w-4xl mx-auto text-center">
            <Image
              src="/images/Excellence-Games-Logo-Gold.png"
              alt="Excellence Games"
              width={120}
              height={120}
              className="mx-auto mb-8"
              priority
            />
            <h1 className="excellence-heading-primary text-5xl md:text-6xl mb-6">
              Our Story
            </h1>
            <p className="text-xl text-black/70">
              Building character through competitive play
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="excellence-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
              <p className="text-black/70 mb-6">
                At Excellence Games, we believe that great games can shape
                character and create lasting connections. Our mission is to
                create competitive board games that not only entertain but also
                foster personal growth, strategic thinking, and meaningful
                social interactions.
              </p>
              <p className="text-black/70">
                We're dedicated to crafting experiences that challenge players
                to think differently, push their boundaries, and discover new
                aspects of themselves and others through the power of play.
              </p>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFB800] to-[#FFC633]">
              <Image
                src="/images/Excellence-Games-Logo-Black.png"
                alt="Excellence Games Mission"
                fill
                className="object-contain p-12"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-black text-white">
        <div className="excellence-container">
          <h2 className="text-3xl font-semibold text-center mb-16">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Excellence</h3>
              <p className="text-white/60">
                We strive for excellence in every game we create, ensuring each
                product meets our high standards of quality and engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-white/60">
                We believe in the power of bringing people together through
                games, creating spaces for connection and shared experiences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovation</h3>
              <p className="text-white/60">
                We continuously push boundaries to create unique gaming
                experiences that challenge and inspire our players.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-20">
        <div className="excellence-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-8">Our Legacy</h2>
            <p className="text-black/70 mb-8">
              Excellence Games is more than just a game company - we're building
              a legacy of competitive games that shape character. From our
              flagship UK Edition to the fast-paced Targeted, each game is
              crafted to leave a lasting impact on players and communities.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-[#FFB800] mb-2">
                  1000+
                </div>
                <div className="text-black/60">Games Sold</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFB800] mb-2">
                  50+
                </div>
                <div className="text-black/60">Events Hosted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFB800] mb-2">
                  4.8/5
                </div>
                <div className="text-black/60">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFB800] mb-2">
                  10+
                </div>
                <div className="text-black/60">Countries Reached</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-[#FFB800]/10 to-[#FFC633]/10">
        <div className="excellence-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-8">Join Our Journey</h2>
            <p className="text-black/70 mb-8">
              We're always looking for passionate individuals and partners who
              share our vision of creating meaningful gaming experiences.
              Whether you're a player, retailer, or potential collaborator, we'd
              love to hear from you.
            </p>
            <Link
              href="/contact"
              className="px-8 py-4 bg-[#FFB800] text-black font-semibold rounded-lg hover:bg-[#FFC633] transition-colors inline-block"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
