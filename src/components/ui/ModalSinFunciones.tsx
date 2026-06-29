export default function ModalSinFunciones({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-foreground mb-2">Sin funciones disponibles</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Lo sentimos, esta película no tiene funciones disponibles actualmente. Intenta con otra película.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
