import MasterPage from "../src/MasterPage";

import Image from "next/image";
import Head from "next/head";
import Chat from "../src/components/Chat/Chat";
import classNames from "classnames";
import styles from "./styles.module.css";

function HomePage(props) {
  return (
    <MasterPage>
      <Head>
        <title>Mystic | Chat</title>
      </Head>
      <Chat />
    </MasterPage>
  );
}

export default HomePage;
