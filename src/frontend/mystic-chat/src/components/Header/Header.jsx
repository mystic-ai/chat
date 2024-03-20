import styles from "./styles.module.css";

import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import classNames from "classnames";
import { useState, useRef, useEffect } from "react";


export default function Header({
  currentPath,
  user = {},
  showCTA = true,
  dashboardMode = false,
}) {


  return (
    <div className={classNames("flex-row", styles.header)} >

      <Link href="https://www.mystic.ai/" target="_blank" ><Image alt="logo" src="/assets/mystic-logo.png" width={87} height={30} style={{
        objectFit: "contain",
      }} />
      </Link>

      <a href="https://github.com/mystic-ai/chat" target="_blank" referrerPolicy="origin">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/mystic-ai/chat" />
      </a>

    </div>
  );
}
