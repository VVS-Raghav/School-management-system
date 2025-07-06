import Gallery from "./gallery/Gallery";
import Carousel from "./carousel/Carousel";

export default function Home() {
  return (
    <div>
      {/* <h1>Home Component</h1> */}
      <Carousel />
      <Gallery />
    </div>
  );
}