import { useParams } from "react-router-dom";

export default function ClubDetail() {
  const { id } = useParams();
  return (
    <div style={{ padding: 24 }}>
      <h1>Club {id}</h1>
    </div>
  );
}
