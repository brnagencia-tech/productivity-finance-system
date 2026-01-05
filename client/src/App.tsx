import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Kanban from "./pages/Kanban";
import VariableExpenses from "./pages/VariableExpenses";
import FixedExpenses from "./pages/FixedExpenses";
import AnnualExpenses from "./pages/AnnualExpenses";
import Habits from "./pages/Habits";
import Categories from "./pages/Categories";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/kanban"} component={Kanban} />
      <Route path={"/expenses/variable"} component={VariableExpenses} />
      <Route path={"/expenses/fixed"} component={FixedExpenses} />
      <Route path={"/expenses/annual"} component={AnnualExpenses} />
      <Route path={"/habits"} component={Habits} />
      <Route path={"/categories"} component={Categories} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
