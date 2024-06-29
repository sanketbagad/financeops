import Image from "next/image";
import Chat from "./_components/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
     <Chat />
    </main>
  );
}
