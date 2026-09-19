import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">
        <Link className="brand" href="/">
          <img src="/pictures/Logo-removebg-preview.png" alt="Alexia's Tours Logo" width={100} />
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/our-services">Our Services</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/destinations">Tours</Link>
          <Link href="/contact-us">Contact Us</Link>
          <a href="https://wa.me/254728085007?text=Hello%20Alexia%20Tours,%20I'm%20interested%20in%20your%20services" target="_blank" rel="noreferrer">+254 728 085 007</a>
          <Link className="button nav-button" href="/book">Book Now</Link>
        </div>
      </nav>
    </header>
  );
}
