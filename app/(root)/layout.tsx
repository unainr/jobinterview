import { Header } from "@/components/layouts/header";
import { MainHeader } from "@/components/layouts/main-header";
import Footer from "@/modules/home/view/ui/components/footer";
import { TypeLayout } from "@/types";
import React from "react";

const Layout = ({ children }: TypeLayout) => {
  return (
    <>
      <Header />
      {children}
      <Footer/>
    </>
  );
};

export default Layout;
