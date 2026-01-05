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
import Contacts from "./pages/Contacts";
import Insights from "./pages/Insights";
import AdminUsers from "./pages/AdminUsers";
import Settings from "./pages/Settings";
import Revenue from "./pages/Revenue";
import Notifications from "./pages/Notifications";
import ManagedLogin from "./pages/ManagedLogin";

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
      <Route path={"/contacts"} component={Contacts} />
      <Route path={"/insights"} component={Insights} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/revenue"} component={Revenue} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/login"} component={ManagedLogin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
