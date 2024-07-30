# Curve External Rewards

This section of the curve-frontend repo contains metadata configuration files for projects to show external rewards for users of curve.

## Reward metadata structure

### Active and Upcoming Campaigns

Only Campaigns listed in [`campaign-list.json`](https://github.com/curvefi/curve-external-reward/blob/main/campaign-list.json), are shown in the front end.

### Each campaign in the campaign-list the must have the following properties:

- `campaign`: File with the data for the campaign

### Example:

```json
[
  {
    "campaign": "ProtocolName.json"
  },
  {
    "campaign": "ProtocolName.json"
  }
]
```

### Each single campaign file in the folder `campaigns` must have the following properties:

- `campaignName`: Name of the rewards campaign, or `null`
- `platform`: Name of the platform running the campaign
- `description`: One-sentence description, not too long
- `platformImageId`: Filename of the app/tool's logo in the [`curve-assets`](https://github.com/curvefi/curve-assets/tree/main/platforms) repo
- `dashboardLink`: Link to protocol dashboard
- pools: Array of relevant pools/markets
  - `id`: Internal id for you, or `null`
  - `poolId`: Curve pool/market id (found in pool/market url on curve.fi or lend.curve.fi)
  - `action`: Action id (found in [`actions.json`](https://github.com/curvefi/curve-frontend/blob/main/packages/external-rewards/src/actions.json))
  - `campaignStart`: Start of the rewards, as UTC timestamp
  - `campaignEnd`: End of the rewards, as UTC timestamp
  - `poolAddress`: Address of the pool/market (use address identified as `controller` for lending markets and action: `borrow`, use address identified as `vault` for action: `supply`)
  - `gaugeAddress`: Address of the gauge, or `null`
  - `network`: Network of the pool/market
  - `multiplier`: Multiplier, or `null`
  - `tags`: Array of pool/market specific tags (any of the tags ids listed here: [`rewards-tags.json`](https://github.com/curvefi/curve-frontend/blob/main/packages/external-rewards/src/reward-tags.json))

### Example:

```json
{
  "campaignName": "Campaign Name",
  "platform": "Platform Name",
  "description": "Points for liqudity provider of USDX",
  "platformImageId": "points_campaign_icon.png",
  "dashboardLink": "https://points.finance/dashboard/",
  "pools": [
    {
      "id": "null",
      "poolId": "factory-stable-ng-1",
      "action": "lp",
      "campaignStart": "0",
      "campaignEnd": "0",
      "poolAddress": "0x0",
      "gaugeAddress": "0x0",
      "network": "ethereum",
      "multiplier": "1x",
      "tags": ["points"]
    }
  ]
}
```

## Adding an rewards to the list

Conditions the project must meet in order to be added to the list of rewards:

1. It must be live

Easy two-step process for your reward to appear on Curve's websites:

1. You'll need to upload the app/tool's logo to the [`curve-assets` repo](https://github.com/curvefi/curve-assets/tree/main/platforms) (submit a PR there, we'll be notified and will review and merge it). It must be a PNG image of at least 200x200 and at most 500x500 px.
2. Submit a PR in this very repository, adding the app/tool's metadata as described above in the [`campaign-list.json`](https://github.com/curvefi/curve-frontend/blob/main/packages/external-rewards/src/campaign-list.json) file and create a new file in the `campaigns` folder for your campaign. You don't have to wait for (1) to be merged to do this. We'll also be notified and will review and merge your PR. _Please provide a very short explanation of how the submitted project fits, if it isn't immediately obvious from the project's metadata in your PR._
