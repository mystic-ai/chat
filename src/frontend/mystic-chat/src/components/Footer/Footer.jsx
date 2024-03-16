import styles from "./Footer.module.css";

function Footer(props) {
  return (
    <div className={styles["footer"]}>
      {/* <div className={styles["footer-row"]}>
        <div className={styles["footer-fill"]} />
        {(props.displayToggle === undefined ||
          props.displayToggle === true) && <DisplayToggle />}
      </div> */}
      <div className="text-small text-secondary flex-row flex-right">Made by<a href="https://www.mystic.ai/" target="_blank" referrerPolicy="origin">Mystic AI</a> &#129497;</div>
    </div>
  );
}

export default Footer;
