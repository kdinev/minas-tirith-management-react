import { IgrExpansionPanel } from "igniteui-react";
import { DataTable, type TableColumn } from "./kit";
import styles from "./table-view.module.css";

/**
 * The relief channel that sits under every chart.
 *
 * A tooltip must never be the only way to read a value, so each chart ships a
 * table twin holding the same figures. It is collapsed by default to keep the
 * console scannable, and it is plain HTML, so it survives print, forced-colours
 * and a screen reader intact.
 */
export function TableView<T>({
  label = "Read the figures as a table",
  caption,
  columns,
  rows,
  rowKey,
}: {
  label?: string;
  caption?: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
}) {
  return (
    <IgrExpansionPanel className={styles.panel}>
      <span slot="title" className={styles.label}>
        {label}
      </span>
      <DataTable caption={caption} columns={columns} rows={rows} rowKey={rowKey} />
    </IgrExpansionPanel>
  );
}
