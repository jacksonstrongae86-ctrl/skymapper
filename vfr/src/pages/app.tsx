import dynamic from "next/dynamic";

const MainApp = dynamic(
  () => import("../components/app/MainApp"),
  { ssr: false }
);

export default function AppPage() {
  return <MainApp />;
}
