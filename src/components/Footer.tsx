import Link from "next/link";
import {
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Apple,
  Play,
  Github,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-0 pb-8 text-center bg-gray-900 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-white">BRUHTATO</h2>

      <div className="flex justify-center space-x-8 mb-6 text-white">
        <Link href="#" className="hover:text-gray-400">
          Publishing
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Stories
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Web Games
        </Link>
      </div>

      <div className="flex justify-center space-x-6 mb-8 text-white">
        <Link href="#" className="hover:text-gray-400">
          <Twitter size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Facebook size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Linkedin size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Instagram size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Apple size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Play size={20} />
        </Link>
        <Link href="#" className="hover:text-gray-400">
          <Github size={20} />
        </Link>
      </div>

      <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-500 mb-4">
        <Link href="#" className="hover:text-gray-400">
          Terms and Conditions
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Privacy Policy
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Content and Behavior Policy
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Cookie Policy
        </Link>
        <Link href="#" className="hover:text-gray-400">
          Privacy Settings
        </Link>
      </div>

      <p className="text-sm text-gray-600">
        © 2025 YOUR COMPANY. All rights reserved.
      </p>
    </footer>
  );
}
