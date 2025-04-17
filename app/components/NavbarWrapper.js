"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname(); // usePathname instead of router.pathname
  const hideNavbarRoutes = ['/chat', '/messages'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(pathname);

  return shouldShowNavbar ? <Navbar /> : null;
}