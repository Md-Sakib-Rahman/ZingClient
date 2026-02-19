import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-content p-10 mt-10 mx-auto max-w-[95%] rounded-3xl my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* About Us Section */}
        <aside className="flex flex-col gap-4">
          <h6 className="footer-title text-xl font-bold opacity-100">Zing</h6>
          <p className="text-sm leading-relaxed max-w-xs">
            At Zing, fashion is more than clothing — it’s confidence in motion. 
            "Where Style Comes Alive," we create modern, comfortable, and trend-driven 
            outfits for everyday life.
          </p>
          <Link to="/products" className="btn btn-secondary w-fit mt-2 hover:scale-105 transition-transform">
            Explore Shop
          </Link>
        </aside>

        {/* Quick Links */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title">Company</h6>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Shop All</a>
          <a className="link link-hover">New Arrivals</a>
          <a className="link link-hover">Terms of Service</a>
        </nav>

        {/* Contact Info */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title">Contact Us</h6>
          <div className="text-sm">
            <p className="font-semibold">Phone:</p>
            <p>01316265186</p>
            <p>01316265216</p>
          </div>
          <div className="text-sm mt-2">
            <p className="font-semibold">Email:</p>
            <a href="mailto:Info@zingfashion.com" className="link link-hover">
              Info@zingfashion.com
            </a>
          </div>
        </nav>

        {/* Address Section */}
        <nav className="flex flex-col gap-2">
          <h6 className="footer-title">Visit Us</h6>
          <p className="text-sm leading-snug">
            Port Connecting Road,<br />
            Halishahar, Noyabazar Bisho road (Mor),<br />
            Chittagong.
          </p>
        </nav>
        
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-focus mt-10 pt-6 text-center text-xs opacity-70">
        <p>© {new Date().getFullYear()} Zing Fashion - All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
