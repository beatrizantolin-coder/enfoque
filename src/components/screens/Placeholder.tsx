export function Placeholder({ label }: { label: string }) {
  return (
    <>
      <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 10px' }}>{label}</h1>
      <div
        style={{
          border: '1px dashed #E5E5E0', borderRadius: '12px', padding: '48px 20px',
          textAlign: 'center', color: '#9A9D93', fontSize: '13px', marginTop: '20px',
        }}
      >
        Todavía no hemos diseñado esta sección — iremos entrando en cada una.
      </div>
    </>
  );
}
