<?php

namespace App\Events;

use App\Models\OutageReport;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OutageReportUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public OutageReport $report)
    {
    }

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [
            new Channel('outages'),
            new Channel('lgu.'.$this->report->lgu_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'report.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->report->id,
            'status' => $this->report->status,
            'severity' => $this->report->ai_severity_score,
            'lgu_id' => $this->report->lgu_id,
        ];
    }
}
