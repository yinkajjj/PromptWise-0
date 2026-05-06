import { 
  Search, 
  Grid3x3, 
  List, 
  SlidersHorizontal, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  X,
  ChevronDown
} from "lucide-react";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PromptCard from "@/components/PromptCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, mockPrompts, tools, tones } from "@/data/mockPrompts";
import { sortPromptsBySmartSearch } from "@/lib/promptSearch";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";


type ViewMode = "grid" | "list";
type SortOption = "popular" | "newest" | "rating" | "alphabetical";

// Category tile data with icons
const categoryTiles = [
  { key: "writing", label: "Writing", icon: "✍️", color: "from-blue-500 to-cyan-500" },
  { key: "image", label: "Image Gen", icon: "🎨", color: "from-purple-500 to-pink-500" },
  { key: "business", label: "Business", icon: "💼", color: "from-green-500 to-emerald-500" },
  { key: "video", label: "Video", icon: "🎬", color: "from-orange-500 to-red-500" },
];

export default function Browse() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let results = mockPrompts;

    // Apply category filters
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }

    // Apply tool filters
    if (selectedTools.length > 0) {
      results = results.filter(p => selectedTools.includes(p.tool));
    }

    // Apply tone filters
    if (selectedTones.length > 0) {
      results = results.filter(p => selectedTones.includes(p.tone));
    }

    // Apply search
    results = sortPromptsBySmartSearch(results, search);

    // Apply sorting
    switch (sortBy) {
      case "popular":
        results = [...results].sort((a, b) => b.copies - a.copies);
        break;
      case "newest":
        results = [...results].sort((a, b) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case "alphabetical":
        results = [...results].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return results;
  }, [search, selectedCategories, selectedTools, selectedTones, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const toggleTone = (tone: string) => {
    setSelectedTones(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTools([]);
    setSelectedTones([]);
    setSearch("");
  };

  const activeFiltersCount = selectedCategories.length + selectedTools.length + selectedTones.length;


  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header Section */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="container py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary mb-1">Catalog</p>
                <h1 className="text-3xl font-bold">Browse Prompts</h1>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mockPrompts.length}</div>
                  <div className="text-xs text-muted-foreground">Prompts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{categories.length - 1}</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{tools.length - 1}</div>
                  <div className="text-xs text-muted-foreground">Tools</div>
                </div>
              </div>
            </div>

            {/* Category Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {categoryTiles.map((cat) => (
                <motion.div
                  key={cat.key}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    onClick={() => toggleCategory(cat.key)}
                    className={cn(
                      "relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all border-2",
                      selectedCategories.includes(cat.key)
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-10",
                      cat.color
                    )} />
                    <div className="relative flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <div className="font-semibold">{cat.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {mockPrompts.filter(p => p.category === cat.key).length} prompts
                        </div>
                      </div>
                    </div>
                    {selectedCategories.includes(cat.key) && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="border-b bg-muted/30 sticky top-[140px] z-20">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, tags, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Popular
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCategories.map(cat => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {categories.find(c => c.key === cat)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                  </Badge>
                ))}
                {selectedTools.map(tool => (
                  <Badge key={tool} variant="secondary" className="gap-1">
                    {tools.find(t => t.key === tool)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTool(tool)} />
                  </Badge>
                ))}
                {selectedTones.map(tone => (
                  <Badge key={tone} variant="secondary" className="gap-1">
                    {tone}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTone(tone)} />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed left-0 top-0 h-screen w-80 bg-card border-r z-40 overflow-y-auto pt-20"
              style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tools Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">AI Tools</h4>
                  <div className="space-y-2">
                    {tools.filter(t => t.key !== "all").map((tool) => (
                      <label
                        key={tool.key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool.key)}
                          onChange={() => toggleTool(tool.key)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{tool.label}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {mockPrompts.filter(p => p.tool === tool.key).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tones Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Tone</h4>
                  <div className="space-y-2">
                    {tones.filter(t => t !== "All Tones").map((tone) => (
                      <label
                        key={tone}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTones.includes(tone.toLowerCase())}
                          onChange={() => toggleTone(tone.toLowerCase())}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{tone}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {mockPrompts.filter(p => p.tone === tone.toLowerCase()).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="container py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'result' : 'results'}
              {search && ` for "${search}"`}
            </h2>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} searchQuery={search} />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="border rounded-xl p-4 bg-card hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{prompt.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{prompt.description}</p>
                        </div>
                        {prompt.isTrending && (
                          <Badge className="bg-orange-500 text-white">Trending</Badge>
                        )}
                        {prompt.isFeatured && !prompt.isTrending && (
                          <Badge className="bg-violet-500 text-white">Featured</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary">{prompt.tool}</Badge>
                        <Badge variant="outline">{prompt.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {prompt.rating}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {prompt.copies} copies
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredPrompts.length === 0 && (
            <div className="text-center py-16">
              <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
