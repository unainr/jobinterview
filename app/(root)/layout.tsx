import { Header } from "@/components/layouts/header";
import { MainHeader } from "@/components/layouts/main-header";
import { TypeLayout } from "@/types";
import React from "react";

const Layout = ({ children }: TypeLayout) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default Layout;
