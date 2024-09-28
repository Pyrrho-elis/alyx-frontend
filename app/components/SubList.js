import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SubList({ members, removeMember }) {
    return (
        <div>
            {/* Table for larger screens */}
            <div className="hidden md:block">
                <Table>
                    <TableCaption>A list of your paying members.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Member Telegram Id</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Expiration Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="w-[100px]">{member.user_id}</TableCell>
                                <TableCell>{member.status}</TableCell>
                                <TableCell>{member.created_at}</TableCell>
                                <TableCell>{member.expiration_date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" onClick={() => removeMember(member.id)}>Remove Member</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Card layout for smaller screens */}
            <div className="md:hidden space-y-4">
                <h2 className="text-xl font-bold mb-4">Paying Members</h2>
                {members.map((member) => (
                    <Card key={member.id}>
                        <CardHeader>
                            <CardTitle>Member ID: {member.user_id}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Status:</strong> {member.status}</p>
                            <p><strong>Join Date:</strong> {member.created_at}</p>
                            <p><strong>Expiration Date:</strong> {member.expiration_date}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="destructive" onClick={() => removeMember(member.id)}>Remove Member</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}