import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PrivateRoute } from "./components/PrivateRoute";
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
import AIInsights from "./pages/AIInsights";
import AdminUsers from "./pages/AdminUsers";
import Settings from "./pages/Settings";
import Revenue from "./pages/Revenue";
import Notifications from "./pages/Notifications";
import ManagedLogin from "./pages/ManagedLogin";
import AdvancedUserManagement from "./pages/AdvancedUserManagement";
import TeamLogin from "./pages/TeamLogin";
// import LoginSelection from "./pages/LoginSelection"; // Removido
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      {/* Rota /login-selection removida - todos usam /team-login */}
      <Route path={"/team-login"} component={TeamLogin} />
      <Route path={"/login"} component={ManagedLogin} />
      <Route path={"/profile"} component={() => <PrivateRoute><Profile /></PrivateRoute>} />
      <Route path={"//"} component={() => <PrivateRoute><Home /></PrivateRoute>} />
      <Route path={"/tasks"} component={() => <PrivateRoute><Tasks /></PrivateRoute>} />
      <Route path={"/kanban"} component={() => <PrivateRoute><Kanban /></PrivateRoute>} />
      <Route path={"/expenses/variable"} component={() => <PrivateRoute><VariableExpenses /></PrivateRoute>} />
      <Route path={"/expenses/fixed"} component={() => <PrivateRoute><FixedExpenses /></PrivateRoute>} />
      <Route path={"/expenses/annual"} component={() => <PrivateRoute><AnnualExpenses /></PrivateRoute>} />
      <Route path={"/habits"} component={() => <PrivateRoute><Habits /></PrivateRoute>} />
      <Route path={"/categories"} component={() => <PrivateRoute><Categories /></PrivateRoute>} />
      <Route path={"/contacts"} component={() => <PrivateRoute><Contacts /></PrivateRoute>} />
      <Route path={"/insights"} component={() => <PrivateRoute><Insights /></PrivateRoute>} />
      <Route path={"/ai-insights"} component={() => <PrivateRoute><AIInsights /></PrivateRoute>} />
      <Route path={"/admin/users"} component={() => <PrivateRoute><AdminUsers /></PrivateRoute>} />
      <Route path={"/admin/users/advanced"} component={() => <PrivateRoute><AdvancedUserManagement /></PrivateRoute>} />
      <Route path={"/settings"} component={() => <PrivateRoute><Settings /></PrivateRoute>} />
      <Route path={"/revenue"} component={() => <PrivateRoute><Revenue /></PrivateRoute>} />
      <Route path={"/notifications"} component={() => <PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path={"/admin/advanced"} component={() => <PrivateRoute><AdvancedUserManagement /></PrivateRoute>} />
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
