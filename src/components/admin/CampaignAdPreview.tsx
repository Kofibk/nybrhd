import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Globe,
  Heart,
  Bookmark,
  Send,
  Instagram,
  Facebook
} from "lucide-react";

interface CampaignAdPreviewProps {
  developmentName: string;
  adCopy: string;
  ctaLabel: string;
  landingPageUrl?: string;
  creativeAsset?: { preview: string; type: "image" | "video"; name: string };
  platform?: "facebook" | "instagram";
}

const CampaignAdPreview = ({ 
  developmentName, 
  adCopy, 
  ctaLabel, 
  landingPageUrl,
  creativeAsset,
  platform = "facebook"
}: CampaignAdPreviewProps) => {
  const formattedCta = ctaLabel
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (platform === "instagram") {
    return (
      <Card className="w-full max-w-[350px] bg-background border overflow-hidden">
        {/* Instagram Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center">
                <span className="text-xs font-bold">N</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold">naybourhood</p>
              <p className="text-[10px] text-muted-foreground">Sponsored</p>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Creative */}
        <div className="aspect-square bg-muted relative">
          {creativeAsset ? (
            creativeAsset.type === "video" ? (
              <video 
                src={creativeAsset.preview} 
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
              />
            ) : (
              <img 
                src={creativeAsset.preview} 
                alt="Ad creative" 
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center p-4">
                <Instagram className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Your creative here</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
              <Send className="h-5 w-5" />
            </div>
            <Bookmark className="h-5 w-5" />
          </div>

          {/* Likes */}
          <p className="text-xs font-semibold">1,234 likes</p>

          {/* Caption */}
          <div className="text-xs">
            <span className="font-semibold">naybourhood </span>
            <span className="text-muted-foreground line-clamp-2">
              {adCopy || `Discover ${developmentName || "your dream property"}`}
            </span>
          </div>

          {/* CTA Button */}
          <Button size="sm" className="w-full text-xs h-8">
            {formattedCta}
          </Button>
        </div>
      </Card>
    );
  }

  // Facebook Layout
  return (
    <Card className="w-full max-w-[400px] bg-background border overflow-hidden">
      {/* Facebook Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Naybourhood</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Sponsored</span>
              <span>·</span>
              <Globe className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Ad Copy */}
      <div className="px-3 pb-2">
        <p className="text-sm line-clamp-3">
          {adCopy || `Discover ${developmentName || "luxury living"} – Your dream property awaits.`}
        </p>
      </div>

      {/* Creative */}
      <div className="aspect-video bg-muted relative">
        {creativeAsset ? (
          creativeAsset.type === "video" ? (
            <video 
              src={creativeAsset.preview} 
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <img 
              src={creativeAsset.preview} 
              alt="Ad creative" 
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="text-center p-6">
              <Facebook className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Your creative here</p>
              <p className="text-xs text-muted-foreground mt-1">Upload an image or video</p>
            </div>
          </div>
        )}
      </div>

      {/* Link Preview */}
      <div className="bg-muted/50 p-3 border-t">
        <p className="text-[10px] text-muted-foreground uppercase truncate">
          {landingPageUrl ? new URL(landingPageUrl.startsWith("http") ? landingPageUrl : `https://${landingPageUrl}`).hostname : "naybourhood.ai"}
        </p>
        <p className="text-sm font-semibold truncate">{developmentName || "Property Development"}</p>
        <p className="text-xs text-muted-foreground truncate">Exclusive property opportunity</p>
      </div>

      {/* CTA */}
      <div className="p-3 border-t">
        <Button className="w-full text-sm" size="sm">
          {formattedCta}
        </Button>
      </div>

      {/* Reactions */}
      <div className="flex items-center justify-between px-3 pb-3 text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="h-2.5 w-2.5 text-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <span>128</span>
        </div>
        <div className="flex gap-3">
          <span>24 comments</span>
          <span>12 shares</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-around border-t py-2 px-3">
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ThumbsUp className="h-4 w-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </Card>
  );
};

export default CampaignAdPreview;
