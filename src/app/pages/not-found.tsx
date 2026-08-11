import { Link } from "react-router-dom";
import { Page, Panel, Prose } from "../ui/kit";

export default function NotFound() {
  return (
    <Page>
      <Panel title="No such despatch">
        <Prose>
          There is nothing filed under that road. Return to the{" "}
          <Link to="/">Steward&rsquo;s Table</Link> and choose a section from the drawer.
        </Prose>
      </Panel>
    </Page>
  );
}
