import FileUpload from "./pages/FileUpload";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900">
              File Upload System
            </h1>
          </div>
        </header>
        <main>
          <FileUpload />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
