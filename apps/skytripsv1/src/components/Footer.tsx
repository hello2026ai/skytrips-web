import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Instagram,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Footer() {
  const router = useRouter();
  const [isAUDomain, setIsAUDomain] = useState(false);

  // State for mobile dropdowns
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
  const [isOtherLinksOpen, setIsOtherLinksOpen] = useState(false);

  useEffect(() => {
    // Check if we're on .au domain
    const hostname = window.location.hostname;
    setIsAUDomain(hostname.endsWith('.au'));
  }, []);

  // Custom navigation handler to avoid automatic prefetching
  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Only if actually clicked, not just hovered
    if (e.type === 'click') {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <footer className="bg-primary-dark  py-[3.5rem]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo and Company Info */}
          <div className="md:col-span-3 space-y-4">
            <Link href="/" className="inline-block" prefetch={false}>
              <Image
                src="/assets/skytripsLogoLight.svg"
                alt="SkyTrips"
                width={100}
                height={40}
                className="mb-0"
              />
            </Link>

            <div className="">
              {isAUDomain ? (
                <div className="space-y-2">
                  <p className="uppercase body-b2 text-primary-on mb-2">
                    HEADQUARTER
                  </p>
                  <p className="label-l2 text-primary-on">
                    A2link Business House Pty Ltd (ABN: 56 648 310 258)
                  </p>
                  <p className="label-l2 text-primary-on mb-4">
                    42 Rainbows Way, Leppington, NSW 2179, Australia
                  </p>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-primary-on" />
                    <a
                      href="tel:+61420678910"
                      className="label-l2 text-primary-on"
                    >
                      +61 420 678 910
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-primary-on" />
                    <a
                      href="mailto:info@skytrips.com.au"
                      className="label-l2 text-primary-on"
                    >
                      info@skytrips.com.au
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-primary-on" />
                    <a
                      href="https://www.skytrips.com.au"
                      className="label-l2 text-primary-on"
                    >
                      www.skytrips.com.au
                    </a>
                  </div>
                  <p className="label-l2 text-primary-on">
                    Registered in Australia | GST Registered
                  </p>
                </div>
              ) : (
                <>
                  <p className="uppercase body-b2 text-primary-on mb-2">
                    HEADQUARTER
                  </p>
                  <p className="label-l2 text-primary-on mb-4">
                    42 Rainbows Way, Leppington NSW 2179
                  </p>

                  <p className="uppercase body-b2 text-primary-on mb-2">
                    NEPAL BRANCH
                  </p>
                  <p className="label-l2 text-primary-on">
                    Lazimpat, Kathmandu - 44601,Nepal
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Company Links */}
          <div className="md:col-span-3 md:flex md:justify-center">
            <div>
              {/* Mobile dropdown header */}
              <div
                className="md:hidden flex items-center  cursor-pointer"
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
              >
                <p className="mb-0 body-b3 text-primary-on">Company</p>
                {isCompanyOpen ? (
                  <ChevronUp className="w-4 h-4 ml-4 text-primary-on" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-4 text-primary-on" />
                )}
              </div>

              {/* Desktop header */}
              <p className="hidden md:block mb-4 body-b3 text-primary-on">
                Company
              </p>

              {/* Links - always visible on desktop, conditional on mobile */}
              <ul
                className={`space-y-3 mt-2 md:mt-0 ${
                  isCompanyOpen ? 'block' : 'hidden'
                } md:block`}
              >
                <li>
                  <Link
                    rel="canonical"
                    href="/about"
                    className="label-l2 text-primary-on"
                    prefetch={false}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    rel="canonical"
                    href="/team"
                    className="label-l2 text-primary-on"
                    prefetch={false}
                  >
                    Our team
                  </Link>
                </li>
                <li>
                  <Link
                    rel="canonical"
                    href="/inquiry"
                    className="label-l2 text-primary-on"
                    prefetch={false}
                  >
                    Inquiry
                  </Link>
                </li>
                <li>
                  <Link
                    rel="canonical"
                    href="/contact-us"
                    className="label-l2 text-primary-on"
                    prefetch={false}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            {/* Mobile dropdown header */}
            <div
              className="md:hidden flex items-center cursor-pointer"
              onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
            >
              <p className="mb-0 body-b3 text-primary-on">Quick links</p>
              {isQuickLinksOpen ? (
                <ChevronUp className="w-4 h-4 ml-4 text-primary-on" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-4 text-primary-on" />
              )}
            </div>

            {/* Desktop header */}
            <p className="hidden md:block mb-4 body-b3 text-primary-on">
              Quick links
            </p>

            {/* Links - always visible on desktop, conditional on mobile */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-3 mt-3 md:mt-0 ${
                isQuickLinksOpen ? 'grid' : 'hidden'
              } md:grid`}
            >
              <div>
                <a
                  href="/flights/sydney-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/sydney-to-kathmandu')
                  }
                >
                  Sydney to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/melbourne-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/melbourne-to-kathmandu')
                  }
                >
                  Melbourne to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/brisbane-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/brisbane-to-kathmandu')
                  }
                >
                  Brisbane to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/perth-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/perth-to-kathmandu')
                  }
                >
                  Perth to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/adelaide-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/adelaide-to-kathmandu')
                  }
                >
                  Adelaide to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/canberra-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/canberra-to-kathmandu')
                  }
                >
                  Canberra to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/hobart-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/hobart-to-kathmandu')
                  }
                >
                  Hobart to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/gold-coast-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/gold-coast-to-kathmandu')
                  }
                >
                  Gold-Coast to KTM
                </a>
              </div>
              <div>
                <a
                  href="/flights/darwin-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/darwin-to-kathmandu')
                  }
                >
                  Darwin to KTM
                </a>
              </div>
              <div>
                <a
                  href="/newcastle-to-kathmandu"
                  className="label-l2 text-primary-on block hover:underline"
                  onClick={(e) =>
                    handleNavigation(e, '/flights/newcastle-to-kathmandu')
                  }
                >
                  Newcastle to KTM
                </a>
              </div>
            </div>
          </div>

          {/* Other Links */}
          <div className="md:col-span-3 md:flex md:justify-center">
            <div>
              {/* Mobile dropdown header */}
              <div
                className="md:hidden flex items-center  cursor-pointer"
                onClick={() => setIsOtherLinksOpen(!isOtherLinksOpen)}
              >
                <p className="mb-1  body-b3 text-primary-on">Other Links</p>
                {isOtherLinksOpen ? (
                  <ChevronUp className="w-4 h-4 ml-4 text-primary-on" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-4 text-primary-on" />
                )}
              </div>

              {/* Desktop header */}
              <p className="hidden md:block mb-2 body-b3 text-primary-on">
                Other Links
              </p>

              {/* Links - always visible on desktop, conditional on mobile */}
              <ul
                className={`space-y-3 ${
                  isOtherLinksOpen ? 'block' : 'hidden'
                } md:block`}
              >
                <li>
                  <Link
                    rel="canonical"
                    href="/privacy-policy"
                    className="label-l2 text-primary-on hover:text-white"
                    prefetch={false}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    rel="canonical"
                    href="/terms-and-conditions"
                    className="label-l2 text-primary-on hover:text-white"
                    prefetch={false}
                  >
                    Terms and Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section with Copyright and Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-[12px] text-primary-on">
            &copy; {new Date().getFullYear()} A2link Business House Pty LTD. All
            rights reserved.
          </p>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://www.facebook.com/share/1FiD1e5VNU/?mibextid=LQQJ4d"
              target="_blank"
              className="label-l2 text-primary-on hover:text-white"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/skytripsworld?igsh=MmRsMDZjMWJrcHBh"
              target="_blank"
              className="label-l2 text-primary-on hover:text-white"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/skytripsworld"
              target="_blank"
              className="label-l2 text-primary-on hover:text-white"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
