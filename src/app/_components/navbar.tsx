"use client";
// components/Navbar.tsx
import Link from "next/link";
import React from "react";
import Image from "next/image";
import Logo from "../../../public/favicon.ico";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const currentPath = usePathname();
  const navItems = [
    { name: "Cases", href: "/home" },
    { name: "Stats", href: "/stats" },
    { name: "About", href: "/about" },
    // Add more items here
  ];

  return (
    <header className="py-4">
      <div className="flex items-center justify-between border-b border-gray-200 py-4">
        {/* Logo and header text */}
        <div className="ml-4">
          <Link href={"/"}>
            <Image src={Logo} alt="Logo" width={32} height={32} />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-40">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <p
                    className={`font-large text-md rounded-md px-3 py-2 ${
                      currentPath === item.href
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Placeholder for star and polygon icons */}
        <div className="flex space-x-4">
          <div className="mr-4">
            <UserButton afterSignOutUrl="/welcome" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
