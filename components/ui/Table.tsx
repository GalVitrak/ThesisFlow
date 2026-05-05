import styles from "./Table.module.css";

export function Table({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className={styles.tr}>{children}</tr>;
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className={styles.th}>{children}</th>;
}

export function Td({
  children,
  colSpan,
}: {
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td className={styles.td} colSpan={colSpan}>
      {children}
    </td>
  );
}
