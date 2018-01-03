import { Agent } from 'https';

export class HttpsAgentFactory {
    private static agents = new Array<Agent>();

    static destroyAllAgents() {
        this.agents.forEach(agent => agent.destroy());
    }

    // Generates a new HTTPs agent
    static getNewHttpsAgent(): Agent {
        const agent = new Agent({ keepAlive: true }); 
        this.agents.push(agent);

        return agent;
    }
}