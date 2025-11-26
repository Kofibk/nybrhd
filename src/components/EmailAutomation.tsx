import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCampaignBuilder from "./EmailCampaignBuilder";
import EmailDripSequence from "./EmailDripSequence";
import EmailPerformance from "./EmailPerformance";

const EmailAutomation = () => {
  return (
    <Tabs defaultValue="builder" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="builder">Campaign Builder</TabsTrigger>
        <TabsTrigger value="sequences">Drip Sequences</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="builder">
        <EmailCampaignBuilder />
      </TabsContent>

      <TabsContent value="sequences">
        <EmailDripSequence />
      </TabsContent>

      <TabsContent value="performance">
        <EmailPerformance />
      </TabsContent>
    </Tabs>
  );
};

export default EmailAutomation;
