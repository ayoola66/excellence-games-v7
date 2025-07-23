import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#FFB800]/10 to-[#FFC633]/10">
        <div className="excellence-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="excellence-heading-primary text-5xl md:text-6xl mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-black/70">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="excellence-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="sticky top-32">
                <h2 className="text-3xl font-semibold mb-6">
                  Contact Information
                </h2>
                <p className="text-black/70 mb-12">
                  Fill out the form and we'll get back to you as soon as
                  possible. You can also reach us using the contact information
                  below.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#FFB800] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email</h3>
                      <p className="text-black/70">info@excellencegames.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#FFB800] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Location</h3>
                      <p className="text-black/70">London, United Kingdom</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#FFB800] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Social Media
                      </h3>
                      <div className="flex space-x-4">
                        <a
                          href="#"
                          className="text-black/70 hover:text-[#FFB800]"
                        >
                          Twitter
                        </a>
                        <a
                          href="#"
                          className="text-black/70 hover:text-[#FFB800]"
                        >
                          Instagram
                        </a>
                        <a
                          href="#"
                          className="text-black/70 hover:text-[#FFB800]"
                        >
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <Image
                    src="/images/Excellence-Games-Logo-Gold.png"
                    alt="Excellence Games"
                    width={120}
                    height={120}
                    className="opacity-50"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-black/5 p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-black/5 border border-transparent focus:border-[#FFB800] focus:outline-none transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-black/5 border border-transparent focus:border-[#FFB800] focus:outline-none transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-black/5 border border-transparent focus:border-[#FFB800] focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-black/5 border border-transparent focus:border-[#FFB800] focus:outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-black/5 border border-transparent focus:border-[#FFB800] focus:outline-none transition-colors resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FFB800] text-black font-semibold rounded-lg hover:bg-[#FFC633] transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-[#FFB800]/10 to-[#FFC633]/10">
        <div className="excellence-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">
                  Where can I buy your games?
                </h3>
                <p className="text-black/70">
                  Our games are available for purchase directly through our
                  online shop. We also work with select retail partners across
                  the UK.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">
                  Do you ship internationally?
                </h3>
                <p className="text-black/70">
                  Yes, we currently ship to select countries. Shipping costs and
                  delivery times vary by location.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">
                  Can I become a retailer?
                </h3>
                <p className="text-black/70">
                  We're always looking to expand our retail network. Please
                  contact us through the form above for wholesale inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
