import FicheForm from "../components/FicheForm";

export default function NouvelleFiche() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">➕ Nouvelle fiche de révision</h1>
      <FicheForm />
    </div>
  );
}
