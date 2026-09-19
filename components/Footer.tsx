import Link from "next/link";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div>
          <img src="/pictures/Logo.jpeg" alt="Alexia's Tours" width={120} />
          <p>Discover the beauty of Kenya with memorable safari and beach experiences tailored for you.</p>
          <Link href="/about-us">More About Us →</Link>
        </div>
        <div>
          <h3>Tour Details</h3>
          <Link href="/">Home</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/destinations">Tours</Link>
          <Link href="/contact-us">Contact Us</Link>
        </div>
        <div>
          <h3>Contact Us</h3>
          <a href="tel:+254728085007">+254 728 085 007</a>
          <a href="mailto:booking@alexiastours.co.ke">booking@alexiastours.co.ke</a>
          <a href="mailto:info@alexiastours.co.ke">info@alexiastours.co.ke</a>
          <p>Nairobi, Kenya</p>
        </div>
        <div>
          <h3>Company & Legals</h3>
          <Link href="/faqs">FAQs</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Alexia&apos;s Tours. All Rights Reserved.</div>
    </footer>
  );
}
