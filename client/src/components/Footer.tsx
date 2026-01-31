const Footer = () => (
  <footer className="w-full border-t border-slate-100 bg-white">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Newsletter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 p-8 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-900">Stay ahead of the curve</h3>
          <p className="text-slate-500 text-sm">Get the latest interview tips and expert insights delivered to your inbox.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white w-full md:w-80 text-sm"
          />
          <button className="h-11 px-8 bg-[#004fcb] hover:bg-[#003bb5] text-white font-semibold rounded-xl text-sm shadow-sm transition-all whitespace-nowrap hover:shadow-md">
            Subscribe
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-0 group relative h-12">
            <img src="/benchmock.png" alt="BenchMock" className="absolute top-[-20px] left-0 h-[90px] w-auto object-contain mix-blend-multiply" />
            <div className="font-bold text-3xl text-[#004fcb] tracking-tight ml-[90px] font-['Outfit']">BenchMock</div>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm max-w-xs">
            The world's leading <span className="text-[#004fcb] font-semibold">AI-powered</span> mock interview platform. Master your interviews with expert guidance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-slate-50 border border-slate-100 hover:border-[#004fcb] hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-[#004fcb] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-slate-50 border border-slate-100 hover:border-[#004fcb] hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-[#004fcb] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Product</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Features</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Pricing</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Use Cases</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Testimonials</a></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Resources</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Blog</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Documentation</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Support Center</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>API Status</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-[#004fcb] text-sm uppercase tracking-widest">Company</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>About Us</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Careers</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Contact Us</a></li>
            <li><a href="#" className="text-slate-500 hover:text-[#004fcb] transition-all duration-200 text-sm font-medium flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#004fcb] transition-colors"></span>Partners</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-slate-400 font-medium text-center md:text-left">
            © {new Date().getFullYear()} <span className="text-[#004fcb] font-bold">BenchMock</span>. All rights reserved.
            <p className="mt-1 text-xs text-slate-400 font-normal">Professional interview preparation with verified experts</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Terms</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Cookies</a>
            <a href="#" className="text-slate-400 hover:text-[#004fcb] transition-all">Security</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;