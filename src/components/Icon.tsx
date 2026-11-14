import {
  Activity, AlertTriangle, Atom, Award, BookOpen, Bot, Boxes, Braces, Building2, Bug, Calculator, CalendarClock,
  CheckCircle2, Circle, Clock, Cloud, Code2, Combine, Compass, Crosshair, Database, DollarSign, Download, Expand,
  Eye, FileText, FileX, Files, Filter, FlaskConical, FolderKanban, Gauge, GitBranch, Globe, Hash, Headphones,
  HeartPulse, Image, KeyRound, Landmark, Layers, Link, ListTree, Lock, LucideProps, Merge, MessageSquare,
  MonitorSmartphone, Network, Package, Plug, Puzzle, RefreshCw, Rocket, Route, Scale, Scissors, Search, Server,
  Share2, ShieldAlert, ShieldCheck, Shuffle, Sparkles, Split, Table, Tags, Target, Telescope, Truck, Unlink,
  UserCheck, UserCircle, Users, Wand2, Workflow, Brain, Zap, Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<LucideProps>> = {
  Activity, AlertTriangle, Atom, Award, BookOpen, Bot, Boxes, Braces, Building2, Bug, Calculator, CalendarClock,
  CheckCircle2, Circle, Clock, Cloud, Code2, Combine, Compass, Crosshair, Database, DollarSign, Download, Expand,
  Eye, FileText, FileX, Files, Filter, FlaskConical, FolderKanban, Gauge, GitBranch, Globe, Hash, Headphones,
  HeartPulse, Image, KeyRound, Landmark, Layers, Link, ListTree, Lock, Merge, MessageSquare,
  MonitorSmartphone, Network, Package, Plug, Puzzle, RefreshCw, Rocket, Route, Scale, Scissors, Search, Server,
  Share2, ShieldAlert, ShieldCheck, Shuffle, Sparkles, Split, Table, Tags, Target, Telescope, Truck, Unlink,
  UserCheck, UserCircle, Users, Wand2, Workflow, Brain, Zap, Wrench,
};

export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  const C = (name && MAP[name]) || Circle;
  return <C {...props} />;
}
