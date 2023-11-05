// components/Navbar.tsx
"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import Logo from "../../../public/favicon.ico";

import { UserButton } from "@clerk/nextjs";

/*

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white py-4">
      <div className="ml-4">
        <Link href="/home">
          <Image src={Logo} alt="Logo" width={30} height={30} layout="fixed" />
        </Link>
      </div>

      <div className="flex">
        <Link href="/cases">
          <p className="mx-4 text-lg text-black no-underline hover:bg-slate-100">
            Cases
          </p>
        </Link>
        <Link href="/mystats">
          <p className="mx-4 text-lg text-black no-underline">My Stats</p>
        </Link>
        <Link href="/about">
          <p className="mx-4 text-lg text-black no-underline">About</p>
        </Link>
      </div>

      <div className="mr-4">
        <UserButton afterSignOutUrl="/welcome" />
      </div>
    </nav>
  );
};*/

import { useState } from "react";

const Navbar = () => {
  const [activeItem, setActiveItem] = useState("/"); // Default active item is home page ('/')

  const navItems = [
    { name: "Cases", href: "/cases" },
    { name: "My Stats", href: "/stats" },
    { name: "About", href: "/about" },
    // Add more items here
  ];

  return (
    <header className="bg-white py-4">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white py-4">
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
                      activeItem === item.href
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveItem(item.href)}
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
