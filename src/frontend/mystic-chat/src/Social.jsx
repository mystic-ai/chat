import Head from "next/head";

function Social({ title, description }) {
  function getImageBase64(platform) {
    const baseData = {
      platform: platform,
    };
    if (title !== undefined) {
      baseData.title = title;
    }
    if (description !== undefined) {
      baseData.description = description;
    }
    const base64 = Buffer.from(JSON.stringify(baseData)).toString("base64");
    return base64;
  }

  return (
    <Head>
      {description !== undefined && (
        <>
          <meta name="description" content={description} key="description" />
          <meta
            property="og:description"
            content={description}
            key="og:description"
          />
          <meta
            name="twitter:description"
            key="twitter:description"
            content={description}
          />
        </>
      )}
      {title !== undefined && (
        <>
          <title>{title} | Flowstream</title>
          <meta property="og:title" content={title} key="og:title" />
          <meta
            name="twitter:title"
            content={`Mystic Chat | ${title}`}
            key="twitter:title"
          />
        </>
      )}
      {title !== undefined && (
        <>
          <meta
            property="og:image"
            content={`https://chat.mystic.ai/social-card/${getImageBase64(
              "linkedin"
            )}`}
            key="og:image"
          />
          <meta
            name="twitter:image"
            content={`https://chat.mystic.ai/social-card/${getImageBase64(
              "twitter"
            )}`}
            key="twitter:image"
          />
        </>
      )}
    </Head>
  );
}

export default Social;
