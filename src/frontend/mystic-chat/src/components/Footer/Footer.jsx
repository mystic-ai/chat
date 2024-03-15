import styles from "./Footer.module.css";

function Footer(props) {
  return (
    <div className={styles["footer"]}>
      <div className={styles["footer-row"]}>
        <div className={styles["footer-fill"]} />
        {(props.displayToggle === undefined ||
          props.displayToggle === true) && <DisplayToggle />}
      </div>
      <p>Made by <a href="https://www.mystic.ai/" target="_blank" referrerPolicy="origin">Mystic AI</a>. &#129497;</p>
    </div>
  );
}

export default Footer;
