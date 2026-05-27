export const SITE_NAME = "Victory Christian";

const DEFAULT_SITE_URL = "https://www.victorychristian.online";
const STARTER_BOOK_TITLE = "No Guide to Womanhood";
const STARTER_DESCRIPTION = "A book for women who are done shrinking. Join the waitlist.";

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    return new URL(configured);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSeoText(content: {
  metadataTitle: string;
  metadataDescription: string;
  bookTitle: string;
  subheadline: string;
}) {
  const bookTitle = content.bookTitle.trim() || SITE_NAME;
  const renamedFromStarter = bookTitle !== STARTER_BOOK_TITLE;
  const primaryBookTitle = bookTitle.split(":")[0]?.trim() || bookTitle;
  const inferredTitle = `${primaryBookTitle} | ${SITE_NAME}`;
  const bookDescription =
    content.subheadline.trim() ||
    `Discover ${bookTitle} from ${SITE_NAME} and join the waitlist for updates.`;
  const title =
    renamedFromStarter && content.metadataTitle.trim() === STARTER_BOOK_TITLE
      ? inferredTitle
      : content.metadataTitle.trim() || bookTitle;
  const description =
    renamedFromStarter && content.metadataDescription.trim() === STARTER_DESCRIPTION
      ? bookDescription
      : content.metadataDescription.trim() || bookDescription;

  return { title, description };
}
