import Navbar from "@/components/Navbar";
import SwipeDeck from "@/components/SwipeDeck";

export default function Find() {
  return (
    <>
      <Navbar activeHref="/find" />
      <SwipeDeck />
    </>
  );
}